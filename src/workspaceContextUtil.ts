/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AuthInfo, Connection } from '@salesforce/core';

import { AuthUtil } from './authUtil'

import { projectPaths } from './utils';

/**
 * Manages the context of a workspace during a session with an open SFDX project.
 */
export class WorkspaceContextUtil {
    protected static instance?: WorkspaceContextUtil;

    protected sessionConnections: Map<string, Connection>;
    protected _username?: string;
    protected _alias?: string;

    protected constructor() {
        this.sessionConnections = new Map<string, Connection>();
    }

    public getAuthUtil(): AuthUtil {
        return AuthUtil.getInstance();
    }

    public async initialize() {

        const defaultUsernameOrAlias = await this.getAuthUtil().getDefaultUsernameOrAlias();

        if (defaultUsernameOrAlias) {
            this._username = await this.getAuthUtil().getUsername(
                defaultUsernameOrAlias
            );
            this._alias =
                defaultUsernameOrAlias !== this._username
                    ? defaultUsernameOrAlias
                    : undefined;
        } else {
            this._username = undefined;
            this._alias = undefined;
        }
    }

    public static getInstance(forceNew = false): WorkspaceContextUtil {
        if (!this.instance || forceNew) {
            this.instance = new WorkspaceContextUtil();
        }
        return this.instance;
    }

    public async getConnection(): Promise<Connection> {
        if (!this._username) {
            throw new Error('error_no_default_username');
        }

        let connection = this.sessionConnections.get(this._username);
        if (!connection) {
            connection = await Connection.create({
                authInfo: await AuthInfo.create({ username: this._username })
            });
            this.sessionConnections.set(this._username, connection);
        }

        return connection;
    }

    get username(): string | undefined {
        return this._username;
    }

    get alias(): string | undefined {
        return this._alias;
    }
}
