import React from 'react'
import { compose } from 'redux';
import { connect, ConnectedProps } from 'react-redux';
import { defaultModel, Model } from '@alephdata/followthemoney'

import NetworkDiagramWrapper from 'embed/NetworkDiagramWrapper';
import EntityTableWrapper from 'embed/EntityTableWrapper';
// import HistogramWrapper from 'embed/HistogramWrapper';

import { IEntityContext } from 'contexts/EntityContext';
import { EntityManager } from 'components/common'

export interface IEmbeddedElementProps {
  entityContext: IEntityContext
  id: string
  data: any
  type: string
  config?: any
}

class EmbeddedElementBase extends React.Component <IEmbeddedElementProps & PropsFromRedux> {
  private entityManager: EntityManager

  constructor(props: IEmbeddedElementProps & PropsFromRedux) {
    super(props)
    if (props.data) {
      this.entityManager = EntityManager.fromJSON({}, props.data?.entities || props.data?.layout?.entities);
    } else {
      this.entityManager = new EntityManager();
    }

    this.onUpdate = this.onUpdate.bind(this);
  }

  onUpdate(additionalData?: any) {
    const { id, config, entities } = this.props;
    if (config?.writeable) {
      const updatedData = JSON.stringify({
        entities,
        ...additionalData
      })
      localStorage.setItem(id, updatedData)
    }
  }

  render() {
    const { config, data, entityContext, type } = this.props;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { entities, ...rest } = data;

    let Element;
    switch (type) {
      case 'EntityTable':
        Element = EntityTableWrapper
        break;
      // case 'Histogram':
      //   return <HistogramWrapper />
      //   break;
      default:
        Element = NetworkDiagramWrapper
        break;
    }

    return (
      <Element
        entityManager={this.entityManager}
        entityContext={entityContext}
        onUpdate={this.onUpdate}
        writeable={config?.writeable}
        layoutData={rest}
      />
    )
  }
}

const mapStateToProps = (state: any, ownProps: IEmbeddedElementProps) => {
  const { entityContext } = ownProps;

  return ({
    entities: entityContext.selectEntities(state),
  });
}

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>

export const EmbeddedElement = connector(EmbeddedElementBase)
