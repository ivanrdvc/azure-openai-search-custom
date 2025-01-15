import { ChatAppResponse } from "../../api";
import { API_CONFIG } from "../../api/config";
import { Answers, HistoryMetaData, HistoryProviderOptions, IHistoryProvider } from "./IProvider";

export class CustomDBProvider implements IHistoryProvider {
    private continuationToken: string | undefined;
    private isItemEnd: boolean = false;

    getProviderName = () => HistoryProviderOptions.CustomDB;

    resetContinuationToken() {
        this.continuationToken = undefined;
        this.isItemEnd = false;
    }

    async getNextItems(count: number, idToken?: string): Promise<HistoryMetaData[]> {
        if (this.isItemEnd) {
            return [];
        }

        try {
            const response = await fetch(`${API_CONFIG.BACKEND_URI}/api/v1/conversations?count=${count}&continuationToken=${this.continuationToken || ""}`, {
                headers: this.getHeaders(idToken)
            });

            if (!response.ok) {
                throw new Error("Failed to fetch conversations");
            }

            const data = await response.json();
            this.continuationToken = data.continuation_token;

            if (!this.continuationToken) {
                this.isItemEnd = true;
            }

            return data.items.map((item: any) => ({
                id: item.id,
                title: item.title,
                timestamp: item.timestamp
            }));
        } catch (error) {
            console.error("Error fetching conversations:", error);
            return [];
        }
    }

    async addItem(id: string, answers: Answers, idToken?: string): Promise<void> {
        const transformedAnswers = answers.map(([user, response]) => ({
            user,
            response
        }));

        const response = await fetch(`${API_CONFIG.BACKEND_URI}/api/v1/conversations`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...this.getHeaders(idToken)
            },
            body: JSON.stringify({id, messages: transformedAnswers})
        });

        if (!response.ok) {
            throw new Error("Failed to save conversation");
        }
    }

    async getItem(id: string, idToken?: string): Promise<Answers | null> {
        try {
            const response = await fetch(`${API_CONFIG.BACKEND_URI}/api/v1/conversations/${id}`, {
                headers: this.getHeaders(idToken)
            });

            if (response.status === 404) {
                return null;
            }

            if (!response.ok) {
                throw new Error("Failed to fetch conversation");
            }

            const data = await response.json();

            const transformedAnswers = data.map(
                (item: { user: string; response: ChatAppResponse }) => [item.user, item.response]
            );
    
            return transformedAnswers;
        } catch (error) {
            console.error("Error fetching conversation:", error);
            return null;
        }
    }

    async deleteItem(id: string, idToken?: string): Promise<void> {
        const response = await fetch(`${API_CONFIG.BACKEND_URI}/api/v1/conversations/${id}`, {
            method: "DELETE",
            headers: this.getHeaders(idToken)
        });

        if (!response.ok) {
            throw new Error("Failed to delete conversation");
        }
    }

    private getHeaders(idToken?: string): HeadersInit {
        const headers: HeadersInit = {};

        if (idToken) {
            headers["Authorization"] = `Bearer ${idToken}`;
        }

        return headers;
    }
}
