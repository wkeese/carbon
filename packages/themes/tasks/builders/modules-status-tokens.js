/**
 * Copyright IBM Corp. 2015, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const { types: t } = require('@carbon/scss-generator');
const { TokenFormat } = require('../../src/tokens');
const { statusTokens } = require('../../src/component-tokens/status');
const { FILE_BANNER, primitive } = require('./shared');
const { paramCase } = require('change-case');

function buildThemesFile() {
  const imports = [t.SassModule('sass:map')];

  const variables = Object.entries(statusTokens).flatMap(
    ([key, statusToken]) => {
      return [
        t.Newline(),
        t.Assignment({
          id: t.Identifier(paramCase(key)),
          init: t.SassMap({
            properties: Object.entries(statusToken).map(([token, value]) => {
              const id = TokenFormat.convert({
                name: token,
                format: TokenFormat.formats.scss,
              });
              return t.SassMapProperty(t.Identifier(id), primitive(value));
            }),
          }),
          default: true,
        }),
      ];
    }
  );

  return t.StyleSheet([FILE_BANNER, t.Newline(), ...imports, ...variables]);
}

module.exports = buildThemesFile;
