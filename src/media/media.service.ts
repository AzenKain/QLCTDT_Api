import { HttpException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import * as FormData from 'form-data';
import { Readable } from 'stream';

@Injectable()
export class MediaService {
  constructor(
    private readonly httpService: HttpService,
  ) { }
  async analyzeFile(file: Express.Multer.File, typeFile: string) {
    const formData = new FormData();
    const fileStream = new Readable();
    fileStream.push(file.buffer);
    fileStream.push(null); 

    formData.append('file', fileStream, { filename: file.originalname });
    formData.append('typeFile', JSON.stringify(typeFile));

    try {
      const response = await firstValueFrom(
        this.httpService.post('http://localhost:8000/read-file', formData, {
          headers: formData.getHeaders(),
        }),
      );
      return response.data;

    } catch (error) {
      throw new HttpException(
        `Failed to analyze file: ${error.message}`,
        error.response?.status || 500,
      );
    }
  }

  async uploadFileService(file: Express.Multer.File) {
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');

    const uploadDir = path.join(process.cwd(), 'uploads', `${currentYear}`, `${currentMonth}`);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const newName = `${Date.now()}`+file.originalname
    const filePath = path.join(uploadDir, newName);

    fs.writeFileSync(filePath, file.buffer);

    const fileUrl = `/uploads/${currentYear}/${currentMonth}/${newName}`;

    return { url: fileUrl };
  }
}
