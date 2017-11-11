import fitbit from 'fitbit-livedata';

export default (RED) => {
  const FitbitLivedataNode = function FitbitLivedataNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    const trackers = [];
    const addresses = [];
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
      msg.payload.map(tracker => tracker.address.toLowerCase()).forEach((a) => {
        if (addresses.indexOf(a) < 0) addresses.push(a);
      });
      if (!isRegisted) {
        isRegisted = true;
        fitbit.on('discover', (tracker) => {
          trackers.push(tracker);
          if (addresses.indexOf(tracker.peripheral.address.toLowerCase()) < 0) return;
          tracker.on('disconnect', (data) => {
            tracker.connect();
          });
        
          tracker.on('connect', () => {
            node.status({ fill: 'blue', shape: 'dot', text: 'connected' });
            msg.payload = {
              event: 'connected',
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
      fitbit.scanTrackers(msg.payload);
    });
  };
  RED.nodes.registerType('livedata', FitbitLivedataNode);
};
