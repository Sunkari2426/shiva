import test from "node:test";
import assert from "node:assert/strict";
import Pickup from "../src/models/Pickup.js";

test("pickup status model includes the documented lifecycle", () => {
  const statuses = Pickup.schema.path("status").enumValues;
  assert.deepEqual(statuses, [
    "PENDING",
    "ASSIGNED",
    "ACCEPTED",
    "EN_ROUTE",
    "ARRIVED",
    "WEIGHING",
    "PAYMENT_PENDING",
    "COMPLETED",
    "CANCELLED"
  ]);
});

test("pickup requires customer, address, schedule and at least one item", () => {
  const pickup = new Pickup({
    scheduledDate: new Date(),
    scheduledTime: "10:00"
  });
  const error = pickup.validateSync();
  assert.ok(error);
  assert.ok(error.errors.customerId);
  assert.ok(error.errors.addressId);
  assert.ok(error.errors.items);
  assert.ok(error.errors.scheduledDate === undefined);
});
