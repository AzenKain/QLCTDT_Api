import { Body, Controller, Get, NotFoundException, Param, Post, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { MediaService } from './media.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';
import { JwtGuardRestApi } from 'src/auth/guard';

@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService
  ) { }
  
  @UseGuards(JwtGuardRestApi)
  @Post('read-file')
  @UseInterceptors(FileInterceptor('file'))
  async readFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() type: string,
  ) {
    return await this.mediaService.analyzeFile(file, type);
  }

  @UseGuards(JwtGuardRestApi)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return await this.mediaService.uploadFileService(file)
  }

  @Get('*')
  async getImage(@Param() params: { '*': string }, @Res() res: Response) {
    const filePath = join(process.cwd(), params['0']);
    try {
      return res.sendFile(filePath);
    } catch (error) {
      console.error('Error sending file:', error);
      throw new NotFoundException('File not found');
    }
  }
}
