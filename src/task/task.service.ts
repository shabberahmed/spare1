import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTaskDto } from 'src/models-dto-type-definitions/2.dto/create-task.dto';
import { UpdateTaskDto } from 'src/models-dto-type-definitions/2.dto/update-task.dto';
import { Task } from 'src/models-dto-type-definitions/3.models/tasks.schema';
import { User } from 'src/models-dto-type-definitions/3.models/user.schema';
import { Organization } from 'src/models-dto-type-definitions/3.models/organization.schema';

import Payment from 'src/models-dto-type-definitions/3.models/payment.schema';
import { TaskStatus, TaskType } from 'src/models-dto-type-definitions/1.types/task,types';

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<Payment>,
    @InjectModel(Organization.name)
    private orgnizationModel: Model<Organization>,
  ) {}

  formatDuration(duration: number): string {
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    return `${hours}h ${minutes}m ${seconds}s`;
  }

  async create(
    createTaskDto: CreateTaskDto,
  ): Promise<{ statusCode: number; message: string; task?: Task; error?: any }> {
    const { createdBy, createdFor, assignedTo } = createTaskDto;
  
    try {
      const createdByExists = await this.userModel.findById(createdBy);
      const createdForExists = await this.userModel.findById(createdFor);
      const assignedToExists = await this.userModel.findById(assignedTo);
  
      if (!createdByExists) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Created By ID does not exist',
        };
      }
      if (!createdForExists) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Created For ID does not exist',
        };
      }
      if (!assignedToExists) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Assigned To ID does not exist',
        };
      }
  
      const isValidTaskType = Object.values(TaskType).includes(
        createTaskDto.taskType as TaskType,
      );
      const isValidTaskStatus = Object.values(TaskStatus).includes(
        createTaskDto.taskStatus as TaskStatus,
      );
  
      if (!isValidTaskType) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid Task Type',
        };
      }
      if (!isValidTaskStatus) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid Task Status',
        };
      }
  
      const paymentData = {
        razorpay_order_id: '',
        razorpay_payment_id: '',
        razorpay_signature: '',
        payment_status: 'idcreated',
        tenant_users: [],
        org_branches: [],
      };
      const createdPayment = await this.paymentModel.create(paymentData);
  
      // Add the payment ID to the task model
      const createdTaskDtoWithPaymentId = {
        ...createTaskDto,
        paymentId: [createdPayment._id], // Initialize as an array
      };
  
      const createdTask = new this.taskModel(createdTaskDtoWithPaymentId);
      const task = await createdTask.save();
  
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Task created successfully',
        task,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: error,
      };
    }
  }
  

  async findAll(): Promise<{ statusCode: number; tasks: Task[] }> {
    try {
      const tasks = await this.taskModel.find();
      return { statusCode: HttpStatus.OK, tasks };
    } catch (error) {
      return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, tasks: [] };
    }
  }

  async findOne(
    id: string,
  ): Promise<{ statusCode: number; message: string; task?: Task }> {
    try {
      const task = await this.taskModel.findById(id).exec();
      if (!task) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Task with ID ${id} not found`,
        };
      }
      return { statusCode: HttpStatus.OK, message: 'Task found', task };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      };
    }
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<{ statusCode: number; message: string; task?: Task }> {
    try {
      const updatedTask = await this.taskModel
        .findByIdAndUpdate(id, updateTaskDto, { new: true })
        .exec();
      if (!updatedTask) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Task with ID ${id} not found`,
        };
      }
      const isValidTaskType = Object.values(TaskType).includes(
        updateTaskDto.taskType as TaskType,
      );
      const isValidTaskStatus = Object.values(TaskStatus).includes(
        updateTaskDto.taskStatus as TaskStatus,
      );
      if (!isValidTaskType) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid Task Type',
        };
      }
      if (!isValidTaskStatus) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid Task Status',
        };
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Task updated successfully',
        task: updatedTask,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      };
    }
  }

  async remove(
    id: string,
  ): Promise<{ statusCode: number; message: string; task?: Task }> {
    try {
      const deletedTask = await this.taskModel.findByIdAndDelete(id).exec();
      if (!deletedTask) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Task with ID ${id} not found`,
        };
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Task deleted successfully',
        task: deletedTask,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      };
    }
  }

  async findTasksCreatedByUser(
    userId: string,
  ): Promise<{ statusCode: number; message: string; tasks?: Task[] }> {
    try {
      const userExists = await this.userModel.findById(userId);
      if (!userExists) {
        return { statusCode: HttpStatus.NOT_FOUND, message: 'User not found' };
      }
      const tasks = await this.taskModel.find({ createdBy: userId });
      return { statusCode: HttpStatus.OK, message: 'Tasks found', tasks };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      };
    }
  }

  async findTasksAssignedToUser(
    userId: string,
  ): Promise<{ statusCode: number; message: string; tasks?: Task[] }> {
    try {
      const userExists = await this.userModel.findById(userId);
      if (!userExists) {
        return { statusCode: HttpStatus.NOT_FOUND, message: 'User not found' };
      }
      const tasks = await this.taskModel.find({ assignedTo: userId });
      return { statusCode: HttpStatus.OK, message: 'Tasks found', tasks };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      };
    }
  }

  async findTasksForUser(
    userId: string,
  ): Promise<{ statusCode: number; message: string; tasks?: Task[] }> {
    try {
      const userExists = await this.userModel.findById(userId);
      if (!userExists) {
        return { statusCode: HttpStatus.NOT_FOUND, message: 'User not found' };
      }
      const tasks = await this.taskModel.find({ createdFor: userId });
      return { statusCode: HttpStatus.OK, message: 'Tasks found', tasks };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      };
    }
  }

  async startTask(id: string): Promise<{
    statusCode: number;
    message: string;
    task?: Task;
    error?: any;
  }> {
    try {
      const task = await this.taskModel.findById(id);
      if (!task) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Task with ID ${id} not found`,
        };
      }
      task.taskStatus = TaskStatus.InProgress;
      task.startTime = new Date();
      console.log(task.startTime, 'start time');
      await task.save();
      return {
        statusCode: HttpStatus.OK,
        message: 'Task started successfully',
        task,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: error.message,
      };
    }
  }

  async endTask(id: string): Promise<{
    statusCode: number;
    message: string;
    task?: Task;
    error?: any;
  }> {
    try {
      const task = await this.taskModel.findById(id);
      if (!task) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Task with ID ${id} not found`,
        };
      }
      task.taskStatus = TaskStatus.Completed;
      task.endTime = new Date();
      console.log(task.endTime, 'end time');
      const duration = task.endTime.getTime() - task.startTime.getTime();
      task.durationHours = duration;
      task.formattedDuration = this.formatDuration(duration);
      await task.save();
      return {
        statusCode: HttpStatus.OK,
        message: 'Task ended successfully',
        task,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: error.message,
      };
    }
  }

  async getTaskDuration(id: string): Promise<{
    statusCode: number;
    message: string;
    finalDuration?: string;
    error?: any;
  }> {
    try {
      const task = await this.taskModel.findById(id);
      if (!task) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Task with ID ${id} not found`,
        };
      }
      if (!task.endTime) {
        const duration = new Date().getTime() - task.startTime.getTime();
        const finalDuration = this.formatDuration(duration);
        return {
          statusCode: HttpStatus.OK,
          message: 'Task not yet ended',
          finalDuration,
        };
      }
      const duration = task.endTime.getTime() - task.startTime.getTime();
      const finalDuration = this.formatDuration(duration);

      return {
        statusCode: HttpStatus.OK,
        message: 'Task duration',
        finalDuration,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: error.message,
      };
    }
  }
}
