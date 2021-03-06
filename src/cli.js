// Required imports
const ArgParse = require('argparse')

function forceInt(value, default_value) {
  value = parseInt(value, 10);
  if (isNaN(value)) {
    value = default_value
  }
  return value;
}

function parseCliArguments() {
  const default_ip_address = '127.0.0.1';
  const default_port = '9944';
  const default_timeout_ms = 5000;
  const default_period_ms = 5000;
  const default_block_delta = 10000;
  const default_startup_delay_ms = 0;
  const default_staking_validators = 0;
  const valid_modes = ["load"];
  const default_mode = "load";

  let parser = ArgParse.ArgumentParser()
  parser.addArgument(
    ['--address'],
    {
      help: 'IP address of the node for sending transactions',
      defaultValue: [default_ip_address, default_port],
      metavar: ['ip-addr', 'port-num'],
      nargs: '+',
      dest: 'address'
    }
  );
  parser.addArgument(
    ['--wss'],
    {
      help: 'Use secure web socket protocol',
      defaultValue: false,
      nargs: 0,
      action: 'storeTrue',
      dest: 'wss'
    }
  );
  parser.addArgument(
    ['--timeout'],
    {
      help: 'Transaction timeout in ms, any transaction exceeding this limit fails the test.',
      defaultValue: default_timeout_ms,
      metavar: 'ms',
      nargs: '1',
      dest: 'timeout_ms'
    }
  );
  parser.addArgument(
    ['--period'],
    {
      help: 'Time between transaction calls in ms',
      defaultValue: default_period_ms,
      metavar: 'ms',
      nargs: '1',
      dest: 'period_ms'
    }
  );
  parser.addArgument(
    ['--target-block'],
    {
      help: 'The change in block height required to conclude testing.',
      defaultValue: default_block_delta,
      metavar: 'height',
      nargs: '1',
      dest: 'block_delta'
    }
  );
  parser.addArgument(
    ['--start-delay'],
    {
      help: 'Start-up delay in ms.',
      defaultValue: default_startup_delay_ms,
      metavar: 'ms',
      nargs: '1',
      dest: 'startup_delay_ms'
    }
  );
  parser.addArgument(
    ['--fund'],
    {
      help: 'Whether to fund the Steves',
      defaultValue: false,
      action: 'storeTrue',
      nargs: '0',
      dest: 'fund'
    }
  );
  parser.addArgument(
    [`--cennznet`],
    {
      help: 'Run against a cennznet chain (default)',
      defaultValue: false,
      action: 'storeTrue',
      nargs: '0',
      dest: 'cennznet'
    }
  );
  parser.addArgument(
    [`--plug`],
    {
      help: 'Run against a plug chain',
      defaultValue: false,
      action: 'storeTrue',
      nargs: '0',
      dest: 'plug'
    }
  );
  parser.addArgument(
    [`--stake`],
    {
      help: 'Add staking validators',
      defaultValue: default_staking_validators,
      nargs: '1',
      dest: 'staking_validators'
    }
  );
  parser.addArgument(
    [`--mode`],
    {
      help: 'Select which mode to run: load (default)' ,
      defaultValue: default_mode,
      nargs: '1',
      dest: 'mode'
    }
  );


  let args = parser.parseArgs()

  // Fill in any blanks for the address config
  if (args.address.length == 1) {
    args.address.push(default_port);
  }
  else if (args.address.length >= 2) {
    args.address[1] = forceInt(args.address[1], default_port);
  }

  // Add ws or wss to address
  let addressString = `://${args.address[0]}:${args.address[1]}`;
  addressString = (args.wss) ? `wss${addressString}` : `ws${addressString}`;

  // Force all integers to be integers
  args.timeout_ms = forceInt(args.timeout_ms, default_timeout_ms);
  args.period_ms = forceInt(args.period_ms, default_period_ms);
  args.block_delta = forceInt(args.block_delta, default_block_delta);
  args.startup_delay_ms = forceInt(args.startup_delay_ms, default_startup_delay_ms);
  args.staking_validators = forceInt(args.staking_validators, 0);

  let api_select = 'cennznet';
  if (args.plug === true && args.cennznet === false) {
    api_select = 'plug';
  }

  // Mode selection:
  if ((args.mode in valid_modes) == false) {
    args.mode = default_mode;
  }

  // Return a settings object
  let settings = {
    mode: args.mode,
    address: addressString,
    startup_delay_ms: args.startup_delay_ms,
    transaction: {
      timeout_ms: args.timeout_ms,
      period_ms: args.period_ms
    },
    exit: {
      block_delta: args.block_delta
    },
    fund: args.fund,
    api: api_select,
    staking_validators: args.staking_validators
  }
  return settings;
}

if (require.main === module) {
  settings = parseCliArguments()

  console.log(settings)
} else {
  // Export modules for testing
  module.exports = {
    parseCliArguments: parseCliArguments
  }
}