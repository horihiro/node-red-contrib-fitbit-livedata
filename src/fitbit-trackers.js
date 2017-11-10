import fitbit from 'fitbit-livedata';

export default (RED) => {
  const FitbitLivedataLoginNode = function FitbitLivedataLoginNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    this.on('input', (msg) => {
      new Promise((resolve) => {
        resolve(msg.payload.toLowerCase());
      }).then((data) => {
        msg.payload = data;
        node.send(msg);
      });
    });
  };
  RED.nodes.registerType('trackers', FitbitLivedataLoginNode);
};
