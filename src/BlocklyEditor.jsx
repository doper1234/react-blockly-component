import React from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';

import BlocklyToolbox from './BlocklyToolbox';
import BlocklyWorkspace from './BlocklyWorkspace';

const BlockPropType = PropTypes.shape({
  type: PropTypes.string,
  shadow: PropTypes.bool,
  fields: PropTypes.object,
  values: PropTypes.object,
  statements: PropTypes.object,
  next: PropTypes.object,
  mutation: PropTypes.shape({
    attributes: PropTypes.object,
    innerContent: PropTypes.string,
  }),
});

const categoryPropsNonRecursive = {
  type: PropTypes.string,
  name: PropTypes.string,
  custom: PropTypes.string,
  colour: PropTypes.string,
  blocks: PropTypes.arrayOf(BlockPropType),
};

const CategoryPropType = PropTypes.shape({
  ...categoryPropsNonRecursive,
  categories: PropTypes.arrayOf(PropTypes.shape(categoryPropsNonRecursive)),
});

const CallbackType = PropTypes.shape({
  key: PropTypes.string.isRequired,
  callback: PropTypes.func.isRequired,
});

class BlocklyEditor extends React.Component {
  static propTypes = {
    initialXml: PropTypes.string,
    workspaceConfiguration: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    wrapperDivClassName: PropTypes.string,
    toolboxCategories: PropTypes.arrayOf(CategoryPropType.isRequired),
    toolboxBlocks: PropTypes.arrayOf(BlockPropType.isRequired),
    xmlDidChange: PropTypes.func,
    workspaceDidChange: PropTypes.func,
    onImportXmlError: PropTypes.func,
    processToolboxCategory: PropTypes.func,
    buttonCallbacks: PropTypes.arrayOf(CallbackType.isRequired),
    toolboxCategoryCallbacks: PropTypes.arrayOf(CallbackType.isRequired),
  };

  static defaultProps = {
    initialXml: null,
    workspaceConfiguration: null,
    wrapperDivClassName: null,
    toolboxCategories: null,
    toolboxBlocks: null,
    xmlDidChange: null,
    workspaceDidChange: null,
    onImportXmlError: null,
    processToolboxCategory: null,
    buttonCallbacks: null,
    toolboxCategoryCallbacks: null,
  };

  componentDidMount = () => {
    this.toolboxDidUpdate();

    if (this.props.xmlDidChange) {
      if (typeof console !== 'undefined') {
        // eslint-disable-next-line no-console
        console.error('Warning: xmlDidChange is deprecated and will be removed in future versions! Please use workspaceDidChange instead.');
      }
    }
  }

  componentDidUpdate = (prevProps) => {
    if (
      (
        this.props.toolboxBlocks &&
        !Immutable.fromJS(this.props.toolboxBlocks)
          .equals(Immutable.fromJS(prevProps.toolboxBlocks))
      ) ||
      (
        this.props.toolboxCategories &&
        !Immutable.fromJS(this.props.toolboxCategories)
          .equals(Immutable.fromJS(prevProps.toolboxCategories))
      )
    ) {
      this.toolboxDidUpdate();
    }
  }

  toolboxDidUpdate = () => {
    const workspaceConfiguration = this.props.workspaceConfiguration || {};
    if (this.workspace && !workspaceConfiguration.readOnly) {
      this.workspace.toolboxDidUpdate(this.toolbox.getRootNode());
    }
  }

  xmlDidChange = (newXml) => {
    if (this.props.xmlDidChange) {
      this.props.xmlDidChange(newXml);
    }
  }

  workspaceDidChange = (workspace) => {
    if (this.props.workspaceDidChange) {
      this.props.workspaceDidChange(workspace);
    }
  }

  importFromXml = xml => this.workspace.importFromXml(xml)

  resize = () => {
    this.workspace.resize();
  }

  render = () => {
    let toolboxMode;
    if (this.props.toolboxCategories) {
      toolboxMode = 'CATEGORIES';
    } else if (this.props.toolboxBlocks) {
      toolboxMode = 'BLOCKS';
    }

    return (
      <div className={this.props.wrapperDivClassName}>
        <BlocklyToolbox
          categories={Immutable.fromJS(this.props.toolboxCategories)}
          blocks={Immutable.fromJS(this.props.toolboxBlocks)}
          didUpdate={this.toolboxDidUpdate}
          processCategory={this.props.processToolboxCategory}
          ref={(toolbox) => { this.toolbox = toolbox; }}
        />
        <BlocklyWorkspace
          ref={(workspace) => { this.workspace = workspace; }}
          initialXml={this.props.initialXml}
          onImportXmlError={this.props.onImportXmlError}
          toolboxMode={toolboxMode}
          xmlDidChange={this.xmlDidChange}
          workspaceDidChange={this.workspaceDidChange}
          wrapperDivClassName={this.props.wrapperDivClassName}
          workspaceConfiguration={this.props.workspaceConfiguration}
          buttonCallbacks={this.props.buttonCallbacks}
          toolboxCategoryCallbacks={this.props.toolboxCategoryCallbacks}
        />
      </div>
    );
  }
}

export default BlocklyEditor;
