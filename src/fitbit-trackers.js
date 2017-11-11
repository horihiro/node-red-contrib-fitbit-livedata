import fitbit from 'fitbit-livedata';

export default (RED) => {
  const FitbitLivedataLoginNode = function FitbitLivedataLoginNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    this.on('input', (msg) => {
      fitbit.getTrackers(msg.payload.auth)
        .then((trackers) => {
          msg.payload = trackers;
          node.send(msg);
        }).catch((err) => {
          node.send(msg);
        });
    });
  };
  RED.nodes.registerType('trackers', FitbitLivedataLoginNode);
};
