import {
  Controller,
  Get,
  Post,
  Body,
  Logger,
  HttpStatus,
  Delete,
  Res,
  Req,
  Patch,
} from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UserAddresDto } from './dto/index';
import { getResponseMessage, errorResponse, message } from '../helper/index';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  private readonly logger = new Logger('User');

  @Post('')
  async create(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    try {
      const data = await this.userService.create(createUserDto);
      if (Object.keys(data).length) {
        res
          .status(HttpStatus.OK)
          .send(getResponseMessage(true, data, message.createUser));
      } else {
        res
          .status(HttpStatus.BAD_REQUEST)
          .send(errorResponse(false, message.userExit));
      }
    } catch (error) {
      this.logger.log(error);
    }
  }

  @Get('find-all')
  async findAll(@Res() res: Response) {
    try {
      const data = await this.userService.findAll();
      if (data.length) {
        res
          .status(HttpStatus.OK)
          .send(getResponseMessage(true, data, message.userFound));
      } else {
        res
          .status(HttpStatus.BAD_REQUEST)
          .send(errorResponse(false, message.noUser));
      }
    } catch (error) {
      this.logger.log(error);
    }
  }

  @Get('')
  async findOne(@Req() req: any, @Res() res: Response) {
    try {
      const data = await this.userService.findOne(req.user.id);
      if (data) {
        res
          .status(HttpStatus.OK)
          .send(getResponseMessage(true, data, message.userFound));
      } else {
        res
          .status(HttpStatus.BAD_REQUEST)
          .send(errorResponse(false, message.noUser));
      }
    } catch (error) {
      this.logger.log(error);
    }
  }

  @Patch('')
  async update(
    @Req() req: any,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res: Response,
  ) {
    try {
      const data = await this.userService.update(req.user.id, updateUserDto);
      if (data) {
        res
          .status(HttpStatus.OK)
          .send(getResponseMessage(true, data, message.updateUser));
      } else {
        res
          .status(HttpStatus.BAD_REQUEST)
          .send(errorResponse(false, message.noUser));
      }
    } catch (error) {
      this.logger.log(error);
    }
  }

  @Delete('')
  async remove(@Req() req: any, @Res() res: Response) {
    try {
      const data = await this.userService.remove(req.user.id);
      if (data) {
        res
          .status(HttpStatus.OK)
          .send(getResponseMessage(true, data, message.deleteUser));
      } else {
        res
          .status(HttpStatus.BAD_REQUEST)
          .send(errorResponse(false, message.noUser));
      }
    } catch (error) {
      this.logger.log(error);
    }
  }

  @Post('address')
  async insertUserAddress(
    @Req() req: any,
    @Body() userAddress: UserAddresDto,
    @Res() res: Response,
  ) {
    try {
      const data = await this.userService.insertUserAddress(
        req.user.id,
        userAddress,
      );
      if (data) {
        res
          .status(HttpStatus.OK)
          .send(getResponseMessage(true, data, message.address));
      } else {
        res
          .status(HttpStatus.BAD_REQUEST)
          .send(errorResponse(false, message.noUser));
      }
    } catch (error) {
      this.logger.log(error);
    }
  }
}
