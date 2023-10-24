// Auto-generated from ./src/UIConfig.json

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { UIConfigButton, UIConfigInput, UIConfigSelect, UIConfigSwitch } from './UIConfig';
export type UIConfigSectionKey =
              'section_general_settings' |
              'section_meter_settings';

export type UIConfigSectionContentKeyOf<K extends UIConfigSectionKey> =
  K extends 'section_general_settings' ?
    'startDelay' |
    'template' |
    'useCache' |
    'smoothBufferSize' |
    'mouseSupport' |
    'font' |
    'fifoPathType' |
    'fifoPath' :

  K extends 'section_meter_settings' ?
    'meter' |
    'listMeters' |
    'randomChangeInterval' |
    'listChangeInterval' :

  never;

export type UIConfigElementOf<K extends UIConfigSectionKey, C extends UIConfigSectionContentKeyOf<K>> =
  K extends 'section_general_settings' ? (
    C extends 'startDelay' ? UIConfigInput<K, 'number'> :
    C extends 'template' ? UIConfigSelect<K> :
    C extends 'useCache' ? UIConfigSwitch<K> :
    C extends 'smoothBufferSize' ? UIConfigInput<K, 'number'> :
    C extends 'mouseSupport' ? UIConfigSwitch<K> :
    C extends 'font' ? UIConfigSelect<K> :
    C extends 'fifoPathType' ? UIConfigSelect<K> :
    C extends 'fifoPath' ? UIConfigInput<K, 'text'> :
    never
  ) :

  K extends 'section_meter_settings' ? (
    C extends 'meter' ? UIConfigSelect<K> :
    C extends 'listMeters' ? UIConfigInput<K, 'text'> :
    C extends 'randomChangeInterval' ? UIConfigInput<K, 'number'> :
    C extends 'listChangeInterval' ? UIConfigInput<K, 'number'> :
    never
  ) :

  never;
