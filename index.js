// native tooling
const fs = require('fs');

// external tooling
const postcss = require('postcss');

// custom variable matches
const customPropertyMatch    = /^--([_a-zA-Z]+[_a-zA-Z0-9-]*)$/;
const customPropertySetMatch = /^--([_a-zA-Z]+[_a-zA-Z0-9-]*):$/;
const customMediaQueryMatch  = /^--([_a-zA-Z]+[_a-zA-Z0-9-]*)\s+(.+)$/;
const customSelectorMatch    = /^:--([_a-zA-Z]+[_a-zA-Z0-9-]*)\s+(.+)$/;

// plugin
module.exports = postcss.plugin('postcss-export-custom-variables', (options = {}) => {
	const {
		customMediaQueryAssigner  = defaultAssigner,
		customPropertyAssigner    = defaultAssigner,
		customPropertySetAssigner = defaultPropertySetAssigner,
		customSelectorAssigner    = defaultAssigner,
		exporter                  = defaultJsExporter,
		variables                 = {}
	} = options;

	return (root) => {
		root.walk(
			(node) => {
				if (isCustomMediaQuery(node)) {
					const [ , name, queries ] = node.params.match(customMediaQueryMatch);

					Object.assign(variables, customMediaQueryAssigner(name, queries, node));
				} else if (isCustomProperty(node)) {
					const [ , property ] = node.prop.match(customPropertyMatch);

					Object.assign(variables, customPropertyAssigner(property, node.value, node));
				} else if (isCustomPropertySet(node)) {
					const [ , property ] = node.selector.match(customPropertySetMatch);

					Object.assign(variables, customPropertySetAssigner(property, node.nodes, node));
				} else if (isCustomSelector(node)) {
					const [ , property, selectors ] = node.params.match(customSelectorMatch);

					Object.assign(variables, customSelectorAssigner(property, selectors, node));
				}
			}
		);

		return exporter === 'js'
			? defaultJsExporter(variables, options, root)
			: exporter === 'json'
				? defaultJsonExporter(variables, options, root)
				: exporter(variables, options, root);
	};
});

// Extensions for default Assigners and default exports

module.exports.defaultAssigner            = defaultAssigner;
module.exports.defaultPropertySetAssigner = defaultPropertySetAssigner;
module.exports.defaultJsExporter          = defaultJsExporter;
module.exports.defaultJsonExporter        = defaultJsonExporter;

// Variable detection functions

function isCustomMediaQuery(node) {
	return node.type === 'atrule' && node.name === 'custom-media' && customMediaQueryMatch.test(node.params);
}

function isCustomProperty(node) {
	return node.type === 'decl'   && customPropertyMatch.test(node.prop);
}

function isCustomPropertySet(node) {
	return node.type === 'rule'   && customPropertySetMatch.test(node.selector);
}

function isCustomSelector(node) {
	return node.type === 'atrule' && node.name === 'custom-selector' && customSelectorMatch.test(node.params);
}

// Default Assigner functions

function defaultAssigner(rawproperty, rawvalue) {
	const property = rawproperty.replace(/-+(.|$)/g, ([ , letter]) => letter.toUpperCase());

	return {
		[property]: rawvalue
	};
}

function defaultPropertySetAssigner(rawproperty, nodes) {
	return defaultAssigner(
		rawproperty,
		Object.assign(
			...nodes.map(
				(node) => {
					const property = node.prop.replace(/-+(.|$)/g, ([ , letter]) => letter.toUpperCase());

					return {
						[property]: node.value
					};
				}
			)
		)
	);
}

// Default export functions

function defaultJsExporter(variables, options, root) {
	const pathname = options.destination || root.source && root.source.input && root.source.input.file && root.source.input.file + '.js' || 'custom-variables.js';
	const contents = Object.keys(variables).reduce(
		(buffer, key) => `${ buffer }export const ${ key } = ${ JSON.stringify(variables[key]).replace(/(^|{|,)"(.+?)":/g, '$1$2:') };\n`,
		''
	);

	return new Promise((resolve, reject) => {
		fs.writeFile(
			pathname,
			contents,
			(error) => error ? reject(error) : resolve()
		);
	});
}

function defaultJsonExporter(variables, options, root) {
	const pathname = options.destination || root.source && root.source.input && root.source.input.file && root.source.input.file + '.json' || 'custom-variables.json';
	const contents = JSON.stringify(variables, null, '  ');

	return new Promise((resolve, reject) => {
		fs.writeFile(
			pathname,
			contents,
			(error) => error ? reject(error) : resolve()
		);
	});
}
