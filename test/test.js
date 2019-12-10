const fs = require('fs');
const path = require('path');

const FormData = require('form-data');
const getPort = require('get-port');
const got = require('got');
const test = require('ava');

const api = require('..');

test.before(async t => {
  t.context.port = await getPort();
  await api.listen(t.context.port);
});

test('deprecated method crop', async t => {
  const form = new FormData();
  form.append(
    'input',
    fs.createReadStream(path.join(__dirname, 'fixtures', 'test.png'))
  );

  form.append(
    'queue',
    JSON.stringify([
      ['resize', 300, 300],
      ['crop', 16]
    ])
  );

  try {
    await got.post(`http://localhost:${t.context.port}`, {
      body: form,
      responseType: 'json'
    });
  } catch (err) {
    t.true(
      err.response.body.message.startsWith(
        'Invalid or deprecated sharp method "crop" was passed.'
      )
    );
  }
});

test('simple resize', async t => {
  const form = new FormData();
  form.append(
    'input',
    fs.createReadStream(path.join(__dirname, 'fixtures', 'test.png'))
  );

  form.append('queue', JSON.stringify([['resize', 300, 300]]));

  const res = await got.post(`http://localhost:${t.context.port}`, {
    body: form
  });

  t.is(res.headers['content-type'], 'application/octet-stream');
});
