import { action } from 'mobx';
import _ from 'lodash';
import utils from './utils';
import Field from './Field';

/**
  Fields Initializer
*/
export default $this => ({

  initField: action('init-Field', (key, path, data, fields = null) => {
    const $fields = fields || $this.fields;
    const initial = $this.state.get('current', 'props');
    // try to get props from separated objects
    const $try = prop => _.has(initial[prop], path) && initial[prop][path];

    $fields.merge({
      [key]: new Field(key, path, data, $this.state, {
        $label: $try('labels'),
        $value: $try('values'),
        $default: $try('defaults'),
        $disabled: $try('disabled'),
        $related: $try('related'),
        $validate: $try('validate'),
        $rules: $try('rules'),
      }),
    });
  }),

  initFields: action('init-Fields', (initial) => {
    const fields = $this.prepareFieldsData(initial);

    $this.state.set('current', 'fields', fields);

    const $path = key => _.trimStart([$this.path, key].join('.'), '.');

    // create fields
    _.each(fields, (field, key) =>
      _.isUndefined($this.select($path(key), null, false))
      && $this.initField(key, $path(key), field));
  }),

  prepareFieldsData: (initial) => {
    let fields = initial.fields || {};
    fields = $this.handleFieldsEmpty(fields, initial);
    fields = $this.handleFieldsArray(fields);
    fields = $this.handleFieldsNested(fields);
    fields = $this.mergeSchemaDefaults(fields);
    return fields;
  },

  handleFieldsArray: ($fields) => {
    let fields = $fields;
    if (_.isArray(fields)) {
      fields = _.reduce(fields, ($obj, $) => {
        // as array of objects (with key and props)
        if (_.isObject($) && _.has($, 'name')) {
          return Object.assign($obj, { [$.name]: $ });
        }
        // as array of strings (with empty values)
        return Object.assign($obj, { [$]: '' });
      }, {});
    }
    return fields;
  },

  handleFieldsEmpty: (fields, initial) => {
    if (!_.isEmpty(fields) || !_.has(initial, 'values')) return fields;
    // if the 'field' object is not provided into the constructor
    // and the 'values' object is passed, use it to create fields
    return _.merge(fields, initial.values);
  },

  handleFieldsNested: fields =>
    _.reduce(fields, (obj, field, key) => {
      if (_.isObject(field)
        && !_.has(field, 'fields')
        && !_(field).hasSome(utils.props)
        && !_(field).hasSome(utils.vprops)) {
        return Object.assign(obj, {
          [key]: { fields: $this.handleFieldsNested(field) },
        });
      }
      return Object.assign(obj, { [key]: field });
    }, {}),

  mergeSchemaDefaults: (fields) => {
    if ($this.validator) {
      const schema = $this.validator.schema();
      const properties = schema.properties;
      if (_.isEmpty(fields) && !!properties) {
        _.each(properties, (prop, key) => {
          _.set(fields, key, {
            value: prop.default,
            label: prop.title,
          });
        });
      }
    }
    return fields;
  },

});
