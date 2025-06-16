import { Entity } from '@/domain/_shared/core/entities/entity';

export interface ProductCommentProps {
  productId: string;
  userId: string;
  content: string;
  rating: number;
}

export class ProductComment extends Entity<ProductCommentProps> {
  static create(
    props: ProductCommentProps,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ): ProductComment {
    const productComment = new ProductComment(props, id, createdAt, updatedAt);
    return productComment;
  }

  get productId() {
    return this.props.productId;
  }

  get userId() {
    return this.props.userId;
  }

  get content() {
    return this.props.content;
  }

  set content(value: string) {
    this.touch();
    this.props.content = value;
  }

  get rating() {
    return this.props.rating;
  }

  set rating(value: number) {
    this.touch();
    this.props.rating = value;
  }
}
