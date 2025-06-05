import { Entity } from '@/domain/_shared/core/entities/entity';

export interface ArtisanProfileProps {
  userId: string;
  userName: string;
  rawMaterial: string;
  technique: string;
  finalityClassification: string;
  sicab: string;
  sicabRegistrationDate: Date;
  sicabValidUntil: Date;
}

export class ArtisanProfile extends Entity<ArtisanProfileProps> {
  static create(
    props: ArtisanProfileProps,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ): ArtisanProfile {
    return new ArtisanProfile({
      ...props,
    }, id, createdAt, updatedAt);
  }

  get userId() {
    return this.props.userId;
  }

  get userName() {
    return this.props.userName;
  }

  set userName(value: string) {
    this.props.userName = value;
    this.touch();
  }

  get rawMaterial() {
    return this.props.rawMaterial;
  }

  get technique() {
    return this.props.technique;
  }

  get finalityClassification() {
    return this.props.finalityClassification;
  }

  get sicab() {
    return this.props.sicab;
  }

  get sicabRegistrationDate() {
    return this.props.sicabRegistrationDate;
  }

  get sicabValidUntil() {
    return this.props.sicabValidUntil;
  }
}
