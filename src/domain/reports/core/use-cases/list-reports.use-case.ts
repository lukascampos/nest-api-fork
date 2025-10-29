import { Injectable, Logger } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ReportRepository } from '../../repositories/report.repository';

export interface ListReportsInput {
  isSolved?: boolean;
  reporterId?: string;
  targetType?: 'product' | 'productRating' | 'user';
  take?: number;
  skip?: number;
}

type Output = Either<Error, unknown>;

@Injectable()
export class ListReportsUseCase {
  private readonly logger = new Logger(ListReportsUseCase.name);

  constructor(private readonly repo: ReportRepository) {
    this.logger.log('ListReportsUseCase initialized');
  }

  async execute(input: ListReportsInput): Promise<Output> {
    try {
      const reports = await this.repo.list(input);
      return right(reports);
    } catch (err) {
      const error = err as Error;
      this.logger.error('Error listing reports', { error: error.message, input });
      return left(new Error('Internal server error'));
    }
  }
}
