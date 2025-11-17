import { Injectable, Logger } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ReportRepository } from '../../../repositories/report.repository';
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

      const sanitizedReport = {
        id: report.id,
        reason: report.reason,
        isSolved: report.isSolved,
        description: report.description,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        reporter: {
          id: report.reporter.id,
          name: report.reporter.name,
          email: report.reporter.email,
        },
        product: report.product?.product ? {
          id: report.product.product.id,
          title: report.product.product.title,
          description: report.product.product.description,
          priceInCents: Number(report.product.product.priceInCents),
          stock: report.product.product.stock,
          slug: report.product.product.slug,
          artisanId: report.product.product.artisanId,
        } : null,
      };

      return right(sanitizedReport);
    } catch (err) {
      const error = err as Error;
      this.logger.error('Error fetching report by id', { id, error: error.message });
      return left(new Error('Internal server error'));
    }
  }
}
