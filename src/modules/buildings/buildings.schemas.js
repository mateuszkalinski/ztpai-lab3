const { z } = require("zod");

const buildingIdParams = z.object({
  id: z.coerce.number().int().positive()
});

const createBuildingBody = z.object({
  name: z.string().trim().min(2).max(100),
  address: z.string().trim().min(5).max(255)
}).strict();

module.exports = { buildingIdParams, createBuildingBody };
