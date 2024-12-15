type tickIdentifier = {
  [key: string]: {
    _autoDeleteTimeout: NodeJS.Timeout;
    ticks: number;
    maxTicks: number;
  };
};

class ExeTicks {
  identifiers: tickIdentifier = {};

  constructor() {}

  public tick(identifier: string, maxTicks: number) {
    const deleteTimeoutMs = 10000;

    if (!this.identifiers[identifier]) {
      this.identifiers[identifier] = {
        _autoDeleteTimeout: setTimeout(() => {
          delete this.identifiers[identifier];
        }, deleteTimeoutMs),
        ticks: 0,
        maxTicks
      };
    }

    if (
      this.identifiers[identifier].ticks < this.identifiers[identifier].maxTicks
    ) {
      this.identifiers[identifier].ticks++;
      clearTimeout(this.identifiers[identifier]._autoDeleteTimeout);
      this.identifiers[identifier]._autoDeleteTimeout = setTimeout(() => {
        delete this.identifiers[identifier];
      }, deleteTimeoutMs);
      return false;
    }

    return true;
  }
}

export default new ExeTicks();
