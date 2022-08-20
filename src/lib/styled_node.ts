import { SELECTOR_TYPE, TAG_DISPLAY_TYPE_MAP } from "./../constants.ts";
import {
  DisplayType,
  PropertyMap,
  Selector,
  StyledNodeInterface,
  Stylesheet,
  ToyElement,
  ToyNode,
  ToyNodeType,
  Value,
} from "../types/types.ts";

export const sortStylesheetByDetail = (stylesheet: Stylesheet): Stylesheet => {
  // split stylesheet per selector type
  const stylesheetHash = stylesheet.rules.reduce<
    { [SELECTOR_TYPE: string]: Stylesheet }
  >((result, rule) => {
    rule.selectors.forEach((selector) => {
      if (!result[selector.type]) {
        result[selector.type] = {
          rules: [],
        };
      }
      result[selector.type].rules.push({
        selectors: [selector],
        declarations: rule.declarations,
      });
    });
    return result;
  }, {});

  return {
    // sort by selectors details
    rules: [
      ...stylesheetHash[SELECTOR_TYPE.UNIVERSAL]
        ? stylesheetHash[SELECTOR_TYPE.UNIVERSAL].rules
        : [],
      ...stylesheetHash[SELECTOR_TYPE.TAG]
        ? stylesheetHash[SELECTOR_TYPE.TAG].rules
        : [],
      ...stylesheetHash[SELECTOR_TYPE.CLASS]
        ? stylesheetHash[SELECTOR_TYPE.CLASS].rules
        : [],
      ...stylesheetHash[SELECTOR_TYPE.ID]
        ? stylesheetHash[SELECTOR_TYPE.ID].rules
        : [],
    ],
  };
};

export class StyledNode implements StyledNodeInterface {
  node: ToyNodeType;
  specificValues: PropertyMap;
  children: StyledNode[];

  constructor(node: ToyNode, stylesheet: Stylesheet) {
    this.node = node.nodeType;
    this.specificValues = this.createSpecificValues(node.nodeType, stylesheet);
    this.children = node.children.map((n) => new StyledNode(n, stylesheet));
  }

  value(name: string) {
    return this.specificValues[name] ? this.specificValues[name] : null;
  }

  lookup(name: string, fallbackName: string, defaultValue: Value): Value {
    return this.value(name) || this.value(fallbackName) || defaultValue;
  }

  display(): DisplayType {
    if (this.value("display")) {
      return this.value("display") as DisplayType;
    }
    if (
      this.isElementNode(this.node) && this.node.tagName in TAG_DISPLAY_TYPE_MAP
    ) {
      return TAG_DISPLAY_TYPE_MAP[this.node.tagName];
    }
    return "inline";
  }

  private isElementNode(node: ToyNodeType): node is ToyElement {
    return typeof node !== "string";
  }

  private matches(nodeType: ToyNodeType, selector: Selector): boolean {
    if (typeof nodeType === "string") {
      return false;
    }
    switch (true) {
      case selector.type === SELECTOR_TYPE.UNIVERSAL:
        return true;
      case selector.type === SELECTOR_TYPE.TAG &&
        nodeType.tagName === selector.name:
        return true;
      case selector.type === SELECTOR_TYPE.ID &&
        nodeType.attributes?.id === selector.name:
        return true;
      case selector.type === SELECTOR_TYPE.CLASS &&
        nodeType.attributes?.class?.split(" ").some((c) => c === selector.name):
        return true;
      default:
        return false;
    }
  }

  private createSpecificValues(
    nodeType: ToyNodeType,
    stylesheet: Stylesheet,
  ): PropertyMap {
    return stylesheet.rules.reduce<PropertyMap>((result, rule) => {
      if (rule.selectors.some((selector) => this.matches(nodeType, selector))) {
        rule.declarations.forEach((declaration) => {
          result[declaration.name] = declaration.value;
        });
      }
      return result;
    }, {});
  }
}

export const buildStyledTree = (
  node: ToyNode,
  stylesheet: Stylesheet,
): StyledNode => {
  const sortedStylesheet = sortStylesheetByDetail(stylesheet);

  return new StyledNode(node, sortedStylesheet);
};
