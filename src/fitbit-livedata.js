import fitbit from 'fitbit-livedata';

fitbit.on('discover', (tracker) => {
  tracker.on('disconnect', (data) => {
    console.log('disconnect');
    tracker.connect();
  });

  tracker.on('connect', (data) => {
    console.log('connect');
  });
  tracker.on('openSession', (data) => {
    console.log('openSession');
  });
  tracker.on('authenticate', (data) => {
    console.log('authenticate');
  });
  tracker.on('sendAuth', (data) => {
    console.log('sendAuth');
  });
  tracker.on('authenticated', (data) => {
    console.log('authenticated');
  });
  tracker.on('data', (livedata) => {
    msg.payload = livedata;
    node.send(msg);
  });
  tracker.connect();
});
fitbit.on('error', (error) => {
  process.stderr.write(`${error}\n`);
  process.exit(1);
});

export default (RED) => {
  const FitbitLivedataNode = function FitbitLivedataNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    this.on('input', (msg) => {
      fitbit.scanTrackers(msg.payload);
    });
  };
  RED.nodes.registerType('livedata', FitbitLivedataNode);
};
