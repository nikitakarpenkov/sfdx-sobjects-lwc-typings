import { ConfigAggregator, StateAggregator } from '@salesforce/core';

const TARGET_ORG = "target-org"
export class AuthUtil {

    private static instance?: AuthUtil;

    public static getInstance() {
        if (AuthUtil.instance === undefined) {
            AuthUtil.instance = new AuthUtil();
        }
        return AuthUtil.instance;
    }

    public async getUsername(usernameOrAlias: string): Promise<string> {
        const info = await StateAggregator.getInstance();
        return info.aliases.getUsername(usernameOrAlias) || usernameOrAlias;
    }

    public async getDefaultUsernameOrAlias(): Promise<string | undefined> {
        try {
            const configAggregator = await ConfigAggregator.create();
            const defaultUsernameOrAlias = configAggregator.getPropertyValue(
                TARGET_ORG
            );
            const defaultUserName =  defaultUsernameOrAlias ? String(defaultUsernameOrAlias) : undefined;
            if (defaultUserName === undefined) {
                return undefined;
            }

            return JSON.stringify(defaultUserName).replace(/\"/g, '');
        } catch (err) {
            console.error(err);
            return undefined;
        }
    }
}
