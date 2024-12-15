let ids = 0;

// Real id or better called Proccess autoincrement id
// Just an internal id for managing the bots processes
export const realID = () => {
  return ids++;
};
