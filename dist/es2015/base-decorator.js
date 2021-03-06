import { metadata } from 'aurelia-metadata';
import { ValidationConfig } from './validation-config';
import { ValidationEngine } from './validation-engine';
import { validationMetadataKey } from 'aurelia-validation';

export function base(targetOrConfig, key, descriptor, Rule) {
  let deco = function (target, key2, descriptor2) {
    let config = metadata.getOrCreateOwn(validationMetadataKey, ValidationConfig, target);
    config.addRule(key2, new Rule(targetOrConfig));

    let innerPropertyName = `_${ key2 }`;

    if (descriptor2.initializer) {
      target[innerPropertyName] = descriptor2.initializer();
    }

    delete descriptor2.writable;
    delete descriptor2.initializer;

    descriptor2.get = function () {
      return this[innerPropertyName];
    };
    descriptor2.set = function (newValue) {
      let reporter = ValidationEngine.getValidationReporter(this);

      this[innerPropertyName] = newValue;

      config.validate(this, reporter);
    };

    descriptor2.get.dependencies = [innerPropertyName];
  };

  if (key) {
    let target = targetOrConfig;
    targetOrConfig = null;
    return deco(target, key, descriptor);
  }
  return deco;
}