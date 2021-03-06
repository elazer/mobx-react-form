import ajv from 'ajv';
import MobxReactForm from '../../../../src';
import { checkUser } from '../../extension/vjf';

const plugins = { svk: ajv };

const fields = {
  username: {
    label: 'Username',
    value: 'SteveJobs',
    validate: [checkUser], // (promise) should fail
  },
  email: {
    label: 'Email',
    value: '12345', // should fail
  },
  password: {
    label: 'Password',
    value: 'thinkdifferent',
  },
};

const schema = {
  type: 'object',
  properties: {
    username: { type: 'string', minLength: 6, maxLength: 20 },
    email: { type: 'string', format: 'email', minLength: 5, maxLength: 20 },
    password: { type: 'string', minLength: 6, maxLength: 20 },
  },
};

class Form extends MobxReactForm {

  onInit(form) {
    // subsequent clear and reset
    form.clear(); // to empty values
    form.reset(); // to default or initial values
  }
}


export default new Form({ fields, schema, plugins }, 'Flat-N');
