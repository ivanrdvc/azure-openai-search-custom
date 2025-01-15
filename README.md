# Azure OpenAI Search Custom Implementation

Custom implementation based on Azure Search OpenAI Demo.

## Setup

### First-time setup
```bash
git clone --filter=blob:none --no-checkout https://github.com/ivanrdvc/azure-openai-search-custom.git
cd azure-openai-search-custom
git sparse-checkout init --cone
git sparse-checkout set app/frontend
git checkout main
git remote add upstream https://github.com/Azure-Samples/azure-search-openai-demo.git
```
For frontend environment configuration details, see [Frontend Setup](./app/frontend/README.md#environment-setup).

### Get updates
```bash
git fetch upstream
git merge upstream/main
```

## Structure
- `/app/frontend` - Azure OpenAI Search frontend (sparse-checkout)
- `/app/backend` - Custom .NET backend implementation (private)

## Source
Based on [Azure Search OpenAI Demo](https://github.com/Azure-Samples/azure-search-openai-demo)