#!/usr/bin/env node
import { Command } from "commander";
import { createModel } from "./commands/createModel.js";
import { validate } from "./commands/validate.js";
import { buildCatalog } from "./commands/buildCatalog.js";

const program = new Command();

program.name("ovium").description("CLI tooling for the Ovium model ecosystem").version("0.0.1");

program
  .command("create-model <name>")
  .description("Scaffold a new model folder with the standard part-based structure")
  .action(createModel);

program
  .command("validate [name]")
  .description("Validate one model (or all models if no name given) against the OviumModel contract")
  .action(validate);

program
  .command("build-catalog")
  .description("Scan every model's metadata.json and regenerate the website's catalog data")
  .action(buildCatalog);

program.parse();
