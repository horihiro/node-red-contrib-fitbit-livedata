import fitbit from 'fitbit-livedata';

export default (RED) => {
  const FitbitLivedataNode = function FitbitLivedataNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    const trackers = [];
    let isRegisted = false;

    node.status({ fill: 'red', shape: 'dot', text: 'scan stopped' });
    fitbit.on('scanStop', () => {
      if (trackers.filter(t => t.status === 'connected').length === 0) {
        node.status({ fill: 'red', shape: 'dot', text: 'scan stopped' });
      }
    });
    fitbit.on('scanStart', () => {
      if (trackers.filter(t => t.status === 'connected').length === 0) {
        node.status({ fill: 'blue', shape: 'ring', text: 'scanning...' });
      }
    });
    this.on('input', (msg) => {
      if (msg.payload.action === 'connect') {
        if (!isRegisted) {
          isRegisted = true;
          fitbit.on('discover', (tracker) => {
            tracker.on('disconnected', () => {
              tracker.connect();
            });
            tracker.on('connecting', () => {
              trackers.push(tracker);
              node.status({ fill: 'blue', shape: 'dot', text: 'connected' });
              msg.payload = {
                event: 'connected',
                tracker,
              };
              node.send(msg);
            });
            tracker.on('data', (livedata) => {
              node.status({ fill: 'yellow', shape: 'dot', text: 'connected' });
              setTimeout(() => {
                node.status({ fill: 'blue', shape: 'dot', text: 'connected' });
              }, 500);
              msg.payload = {
                event: 'data',
                data: livedata,
              };
              node.send(msg);
            });
            tracker.connect();
          });
        }
        console.log(msg.payload);
        fitbit.scanTrackers(msg.payload.trackers);
      } else if (msg.payload.action === 'disconnect') {
        const addresses = msg.payload.trackers && msg.payload.trackers.length > 0 ?
          msg.payload.trackers.map(t => t.address.toLowerCase()) :
          trackers.map(t => t.peripheral.address.toLowerCase());
        trackers.filter(t =>
          addresses.indexOf(t.peripheral.address.toLowerCase()) >= 0).reduce((p, t) =>
          p.then(() => {
            t.removeAllListeners('disconnected');
            t.on('disconnected', () => {
              const pos = trackers.map(i =>
                i.peripheral.address.toLowerCase()).indexOf(t.peripheral.address.toLowerCase());
              trackers.splice(pos, 1);

              msg.payload = {
                event: 'disconnected',
                tracker: t,
              };
              node.send(msg);
            });
            return t.disconnect();
          }), Promise.resolve())
          .then(() => {
            if (trackers.length === 0) node.status({ fill: 'red', shape: 'dot', text: 'scan stopped' });
          });
      }
    });
  };
  RED.nodes.registerType('livedata', FitbitLivedataNode);
};
