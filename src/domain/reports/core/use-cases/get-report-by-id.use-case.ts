import { Injectable, Logger } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ReportRepository } from '../../repositories/report.repository';
import { ReportNotFoundError } from '../errors/report-not-found.error';

type Output = Either<Error, object>;

@Injectable()
export class GetReportByIdUseCase {
  private readonly logger = new Logger(GetReportByIdUseCase.name);

  constructor(private readonly repo: ReportRepository) {
    this.logger.log('GetReportByIdUseCase initialized');
  }

  async execute(id: string): Promise<Output> {
    try {
      const report = await this.repo.findById(id);

      if (!report) {
        this.logger.warn('Report not found', { id });
        return left(new ReportNotFoundError());
      }

      return right(report);
    } catch (err) {
      const error = err as Error;
      this.logger.error('Error fetching report by id', { id, error: error.message });
      return left(new Error('Internal server error'));
    }
  }
}
