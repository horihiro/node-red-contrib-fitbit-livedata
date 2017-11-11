import fitbit from 'fitbit-livedata';

export default (RED) => {
  const FitbitLivedataNode = function FitbitLivedataNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    this.on('input', (msg) => {
      const addresses = msg.payload.map(tracker => tracker.address.toLowerCase());
      fitbit.on('discover', (tracker) => {
        if (addresses.indexOf(tracker.peripheral.address.toLowerCase()) < 0) return;
        tracker.on('disconnect', (data) => {
          tracker.connect();
        });
      
        tracker.on('connect', () => {
        });
        tracker.on('openSession', (data) => {
        });
        tracker.on('authenticate', (data) => {
        });
        tracker.on('sendAuth', (data) => {
        });
        tracker.on('authenticated', (data) => {
        });
        tracker.on('data', (livedata) => {
          msg.payload = livedata;
          node.send(msg);
        });
        tracker.connect();
      });
      fitbit.scanTrackers(msg.payload);
    });
  };
  RED.nodes.registerType('livedata', FitbitLivedataNode);
};
