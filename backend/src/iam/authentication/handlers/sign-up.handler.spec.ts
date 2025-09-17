import { SignUpHandler } from './sign-up.handler';
import { HashingService } from '../services/hashing/hashing.service';
import { JwtService } from '@nestjs/jwt';


describe('SignUpHandler', () => {
    let handler: SignUpHandler;
    let hashingService: HashingService;
    let jwtService: JwtService;
    let userModel: any;

    beforeEach(() => {
        userModel = {
            findOne: jest.fn(),
            create: jest.fn(),
        };
        hashingService = { hash: jest.fn() } as any;
        jwtService = { sign: jest.fn() } as any;
        handler = new SignUpHandler(
            userModel,
            hashingService,
            jwtService,
            { secret: 'testSecret', signOptions: { expiresIn: '1h' } } as any
        );
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
