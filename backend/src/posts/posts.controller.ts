import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly service: PostsService) {}

  @Get()           // ← GET /posts
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')          // ← GET /posts/1
findOne(@Param('id') id: string) {
  return this.service.findOne(+id);
}

  @Post()          // ← POST /posts
  create(@Body() dto: { title: string; body?: string }) {
    return this.service.create(dto);
  }

  @Delete(':id')   // ← DELETE /posts/:id
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
