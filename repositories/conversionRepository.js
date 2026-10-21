const conversions = [];
let nextId = 1;

export const save = async (conversion) => {
  const record = { id: nextId++, createdAt: new Date(), ...conversion };
  conversions.push(record);
  return record;
};

export const findAll = async () => [...conversions];

export const findById = async (id) =>
  conversions.find((c) => c.id === Number(id)) ?? null;
