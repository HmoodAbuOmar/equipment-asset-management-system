from dotenv import load_dotenv
from langchain.agents import create_agent
from langchain_openrouter import ChatOpenRouter
from app.tools import get_asset_summary

from app.system_prompt import SYSTEM_PROMPT

load_dotenv()

model = ChatOpenRouter(
    model="openrouter/free"
)

agent = create_agent(
    model=model,
    tools=[get_asset_summary],
    system_prompt=SYSTEM_PROMPT
)


def ask_agent(message: str) -> str:
    result = agent.invoke(
        {
            "messages": [
                {
                    "role": "user",
                    "content": message
                }
            ]
        }
    )

    return result["messages"][-1].content