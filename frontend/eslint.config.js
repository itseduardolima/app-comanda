// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

/**
 * Style-file pattern (frontend/.specs/03-estilos.md): every component and
 * screen keeps its styles in a `*.styles.ts` built with `createStyles`, so
 * JSX never carries an inline `style={{ … }}` object.
 *
 * Escape hatch for genuinely runtime-derived values (a percentage width, a
 * measured height): disable the rule on that line AND say which value forces
 * it. A bare disable is a review bug.
 */
const noInlineStyleObject = {
  selector: "JSXAttribute[name.name='style'] > JSXExpressionContainer > ObjectExpression",
  message:
    'Sem estilo inline: mova para o *.styles.ts do componente/tela (createStyles). Ver frontend/.specs/03-estilos.md.',
};

/** Same rule for the array form: style={[styles.a, { padding: 8 }]}. */
const noInlineStyleObjectInArray = {
  selector:
    "JSXAttribute[name.name='style'] > JSXExpressionContainer > ArrayExpression > ObjectExpression",
  message:
    'Sem estilo inline: use uma chave de variante no *.styles.ts e componha com array. Ver frontend/.specs/03-estilos.md.',
};

/** And inside a Pressable style callback: style={({ pressed }) => [{ … }]}. */
const noInlineStyleObjectInCallback = {
  selector:
    "JSXAttribute[name.name='style'] > JSXExpressionContainer > ArrowFunctionExpression ObjectExpression",
  message:
    'Sem estilo inline: declare a variante no *.styles.ts e componha no callback. Ver frontend/.specs/03-estilos.md.',
};

/**
 * `style` is not the only style prop: contentContainerStyle, columnWrapperStyle,
 * headerStyle and friends all take style objects too.
 */
const noInlineStyleObjectInNamedStyleProp = {
  selector:
    "JSXAttribute[name.name=/[Ss]tyle$/]:not([name.name='style']) > JSXExpressionContainer > ObjectExpression",
  message:
    'Sem estilo inline: qualquer prop *Style vai para o *.styles.ts. Ver frontend/.specs/03-estilos.md.',
};

/**
 * And navigator options carry styles outside JSX entirely — expo-router takes
 * `screenOptions={{ headerStyle: { … } }}`, which no JSX selector reaches.
 */
const noInlineStyleObjectInOptions = {
  selector: 'Property[key.name=/[Ss]tyle$/] > ObjectExpression',
  message:
    'Sem estilo inline: mova a opção de navegação para src/styles/navigation.styles.ts. Ver frontend/.specs/03-estilos.md.',
};

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*'],
  },
  {
    files: ['app/**/*.tsx', 'src/**/*.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        noInlineStyleObject,
        noInlineStyleObjectInArray,
        noInlineStyleObjectInCallback,
        noInlineStyleObjectInNamedStyleProp,
        noInlineStyleObjectInOptions,
      ],
    },
  },
]);
