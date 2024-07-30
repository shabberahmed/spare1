import { Logger, NotFoundException } from '@nestjs/common';
import {
  Connection,
  FilterQuery,
  Model,
  Types,
  UpdateQuery,
  SaveOptions,
  HydratedDocument,
} from 'mongoose';
import { CommonDocument } from './common.schema';

export abstract class AbstractRepository<TDocument extends CommonDocument> {
  protected abstract readonly logger: Logger;
  constructor(
    protected readonly model: Model<TDocument>,
    private readonly connection: Connection,
  ) {}

  async create(
    document: Omit<TDocument, '_id'>,
    options?: SaveOptions,
  ): Promise<TDocument> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    const newDocument = (
      await createdDocument.save(options)
    ).toJSON() as TDocument;
    return newDocument;
  }

  async findOne(
    filterQuery: FilterQuery<TDocument>,
    options?: SaveOptions,
  ): Promise<TDocument> {
    const document = await this.model.findOne(
      filterQuery,
      {},
      { lean: true, ...options },
    );

    if (!document) {
      this.logger.warn('Document not found with filterquery -> ', filterQuery);
    }

    return document as TDocument;
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
    options?: SaveOptions,
  ): Promise<TDocument> {
    const document = await this.model.findOne(filterQuery, {
      options,
    });

    if (!document) {
      this.logger.warn('Document not found with filterquery -> ', filterQuery);
      throw new NotFoundException('Document not found');
    }

    const updatedDocument = await document.updateOne(
      { update },
      {
        lean: true,
        new: true,
        options,
      },
    );

    return updatedDocument as TDocument;
  }

  async updateOne(
    document: HydratedDocument<TDocument>,
    update: UpdateQuery<TDocument>,
    options?: SaveOptions,
  ): Promise<TDocument> {
    const updatedDocument = await document.updateOne(
      { update },
      {
        lean: true,
        new: true,
        options,
      },
    );

    return updatedDocument as TDocument;
  }

  async findAll(filterQuery: FilterQuery<TDocument>): Promise<TDocument[]> {
    return (await this.model
      .find(filterQuery, {}, { lean: true })
      .exec()) as TDocument[];
  }

  async findOneAndDelete(
    filterQuery: FilterQuery<TDocument>,
  ): Promise<TDocument> {
    return (await this.model
      .findOneAndDelete(filterQuery, { lean: true })
      .exec()) as TDocument;
  }

  async _startTransaction(): Promise<any> {
    const session = await this.connection.startSession();
    session.startTransaction();
    return session;
  }
}
