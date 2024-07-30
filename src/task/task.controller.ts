
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from 'src/models-dto-type-definitions/2.dto/create-task.dto';
import { UpdateTaskDto } from 'src/models-dto-type-definitions/2.dto/update-task.dto';
import { Response } from 'express';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post('create-task')
  async create(@Body() createTaskDto: CreateTaskDto, @Res() res: Response) {
    console.log("called")
    const result = await this.taskService.create(createTaskDto);
    return res.status(result.statusCode).json(result);
  }

  @Get('all')
  async findAll(@Res() res: Response) {
    const result = await this.taskService.findAll();
    return res.status(result.statusCode).json(result);
  }

  @Get('task/:id')
  async findOne(@Param('id') id: string, @Res() res: Response) {

    const result = await this.taskService.findOne(id);
    return res.status(result.statusCode).json(result);
  }

  @Put('task/:id')
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Res() res: Response) {
    const result = await this.taskService.update(id, updateTaskDto);
    return res.status(result.statusCode).json(result);
  }

  @Delete('task/:id')
  async remove(@Param('id') id: string, @Res() res: Response) {
    const result = await this.taskService.remove(id);
    return res.status(result.statusCode).json(result);
  }
  // give user id
  @Get('createdBy/:userId')
  async findTasksCreatedByUser(@Param('userId') userId: string) {
    return this.taskService.findTasksCreatedByUser(userId);
  }

  @Get('assignedTo/:userId')
  async findTasksAssignedToUser(@Param('userId') userId: string) {
    return this.taskService.findTasksAssignedToUser(userId);
  }

  @Post('forUser/:userId')
  async findTasksForUser(@Param('userId') userId: string) {
    return this.taskService.findTasksForUser(userId);
  }
  @Get('task-start/:id')
  async startTask(@Param('id') id: string, @Res() res: Response) {
    const result = await this.taskService.startTask(id);
    return res.status(result.statusCode).json(result);
  }
  @Post('task-stop/:id')
  async stopTask(@Param('id') id: string, @Res() res: Response) {
    const result = await this.taskService.endTask(id);
    return res.status(result.statusCode).json(result);
  }
  @Get("task-duration/:id")
  async getTaskDuration(@Param('id') id: string) {
    return this.taskService.getTaskDuration(id);
}
}