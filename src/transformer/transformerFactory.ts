/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Connection } from '@salesforce/core';
import { WorkspaceContextUtil } from '../workspaceContextUtil';
import { EventEmitter } from 'events';
import { SObjectSelector, SObjectShortDescription } from '../describe';
import { TypingGenerator } from '../generator';

import {
  OrgObjectDetailRetriever,
  OrgObjectRetriever
} from '../retriever';
import {
  SObjectCategory,
  SObjectDefinitionRetriever,
  SObjectGenerator,
} from '../types';
import { SObjectTransformer } from './sobjectTransformer';

export class SObjectTransformerFactory {
  public static async create(
    emitter: EventEmitter,
    category: SObjectCategory
  ): Promise<SObjectTransformer> {
    const retrievers: SObjectDefinitionRetriever[] = [];
    const generators: SObjectGenerator[] = [];

    const connection = await SObjectTransformerFactory.createConnection();

    retrievers.push(
      new OrgObjectRetriever(connection),
      new OrgObjectDetailRetriever(
        connection,
        new GeneralSObjectSelector(category)
      )
    );

    generators.push(new TypingGenerator());

    return new SObjectTransformer(
      emitter,
      retrievers,
      generators,
    );
  }

  public static async createConnection(): Promise<Connection> {
    const workspaceContext = await WorkspaceContextUtil.getInstance();
    await workspaceContext.initialize();
    return workspaceContext.getConnection();
  }
}

export class GeneralSObjectSelector implements SObjectSelector {
  private category: SObjectCategory;

  public constructor(category: SObjectCategory) {
    this.category = category;
  }

  public select(sobject: SObjectShortDescription): boolean {
    const isCustomObject =
      sobject.custom === true;
    const isStandardObject =
      sobject.custom === false;

    if (this.category === SObjectCategory.ALL || this.category === SObjectCategory.STANDARD) {
      if (isStandardObject) {
        return true;
      }
    }

    if (this.category === SObjectCategory.ALL || this.category === SObjectCategory.CUSTOM) {
      if (isCustomObject) {
        return true;
      }
    }

    return false;
  }

}
