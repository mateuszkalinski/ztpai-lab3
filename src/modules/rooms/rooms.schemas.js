const { z } = require("zod");

const roomIdParams = z.object({
  id: z.coerce.number().int().positive()
});

module.exports = { roomIdParams };