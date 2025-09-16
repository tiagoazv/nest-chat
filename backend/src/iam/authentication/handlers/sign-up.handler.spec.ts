import { Test, TestingModule } from '@nestjs/testing';
import { SignUpHandler } from './sign-up.handler';
import { HashingService } from '../services/hashing/hashing.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/user.schema';
import { getModelToken } from '@nestjs/mongoose';
import jwtConfig from 'src/iam/config/jwt.config';

describe('SignUpHandler', () => {
    let handler: SignUpHandler;
    let hashingService: HashingService;
    let jwtService: JwtService;
    let userModel: any;

    beforeEach(async () => {
        userModel = {
            findOne: jest.fn(),
            create: jest.fn(),
        };
        
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SignUpHandler,
                HashingService,
                JwtService,
                {
                    provide: getModelToken(User.name),
                    useValue: userModel,
                },
                {
                    provide: jwtConfig.KEY,
                    useValue: { secret: 'testSecret', signOptions: { expiresIn: '1h' } }
                }
            ],
        }).compile();

        handler = module.get<SignUpHandler>(SignUpHandler);
        hashingService = module.get<HashingService>(HashingService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    it('should hash password and create user', async () => {
        const signUpDto = { name: 'Test User', email: 'teste@gmail.com', password: 'password123', role: 'regular' as any };
        const hashedPassword = 'hashedPassword123';
        const userToCreate = {...signUpDto, password: hashedPassword };
        const createdUser = { _id: '123', ...userToCreate };
        const token = 'jwtToken';

        jest.spyOn(hashingService, 'hash').mockResolvedValue(hashedPassword);
        jest.spyOn(userModel, 'create').mockResolvedValue(createdUser);
        jest.spyOn(jwtService, 'sign').mockReturnValue(token);

        const result = await handler.execute(signUpDto);

        expect(result).toEqual({ user: createdUser, token });
        expect(hashingService.hash).toHaveBeenCalledWith(signUpDto.password);
        expect(userModel.create).toHaveBeenCalledWith(userToCreate);
        expect(jwtService.sign).toHaveBeenCalledWith({ sub: createdUser._id, email: createdUser.email }, { secret: 'testSecret'});
    });

    it('should throw error if user creation fails', async () => {
        const signUpDto = { name: 'Test User', email: 'teste@gmail.com', password: 'password123', role: 'regular' as any };
        jest.spyOn(userModel, 'create').mockRejectedValue(new Error('User creation failed'));

        await expect(handler.execute(signUpDto)).rejects.toThrow('User creation failed');
        expect(userModel.create).toHaveBeenCalled();
    });
});
