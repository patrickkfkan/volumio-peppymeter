// Auto-generated from ./src/UIConfig.json

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { UIConfigButton, UIConfigInput, UIConfigSelect, UIConfigSwitch } from './UIConfig';
export type UIConfigSectionKey =
              'section_meter_settings';

export type UIConfigSectionContentKeyOf<K extends UIConfigSectionKey> =
  K extends 'section_meter_settings' ?
    'startDelay' |
    'template' |
    'randomInterval' |
    'useCache' |
    'smoothBufferSize' |
    'mouseSupport' |
    'fifoPathType' |
    'font' |
    'fifoPath' :

  never;

export type UIConfigElementOf<K extends UIConfigSectionKey, C extends UIConfigSectionContentKeyOf<K>> =
  K extends 'section_meter_settings' ? (
    C extends 'startDelay' ? UIConfigInput<K, 'number'> :
    C extends 'template' ? UIConfigSelect<K> :
    C extends 'randomInterval' ? UIConfigInput<K, 'number'> :
    C extends 'useCache' ? UIConfigSwitch<K> :
    C extends 'smoothBufferSize' ? UIConfigInput<K, 'number'> :
    C extends 'mouseSupport' ? UIConfigSwitch<K> :
    C extends 'fifoPathType' ? UIConfigSelect<K> :
    C extends 'font' ? UIConfigSelect<K> :
    C extends 'fifoPath' ? UIConfigInput<K, 'text'> :
    never
  ) :

  never;