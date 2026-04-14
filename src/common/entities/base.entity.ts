import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

/**
 * Abstract base entity providing UUID primary key, timestamps, and soft-delete.
 * All new entities MUST extend this class for consistency.
 *
 * @field id - UUID v4 primary key
 * @field created_at - Auto-set on insert
 * @field updated_at - Auto-set on update
 * @field deleted_at - Null unless soft-deleted
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at: Date;
}
