import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  SettingEntity,
  SettingsSecretsCipher,
  SettingsService,
} from '@habit-maker/api-settings-infrastructure';

@Module({
  imports: [TypeOrmModule.forFeature([SettingEntity])],
  providers: [SettingsService, SettingsSecretsCipher],
  exports: [SettingsService],
})
export class SettingsModule {}
