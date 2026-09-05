import { getSiteContent, placeholder } from "@/lib/content"

export default function Home() {
  const { business } = getSiteContent()
  return (
    <>
      <h1>{placeholder(business.name, "business name")}</h1>
    </>
  )
}
