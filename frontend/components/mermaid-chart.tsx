import React, { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

interface MermaidChartProps {
  chart: string
}

const MermaidChart: React.FC<MermaidChartProps> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        securityLevel: 'loose',
        themeVariables: {
          primaryColor: '#111111',
          primaryBorderColor: '#5555aa',
          primaryTextColor: '#dddddd',
          lineColor: '#ff9944',
        },
      })

      const id = `mermaid-${crypto.randomUUID()}`

      const safeRender = async () => {
        try {
          const { svg } = await mermaid.render(id, chart)
          
          if (ref.current) {
            ref.current.innerHTML = svg
          }
        } catch {
          const trash = document.getElementById(`d${id}`)
          if (trash?.parentNode) trash.parentNode.removeChild(trash)

          if (ref.current) {
            ref.current.innerHTML = `<pre>${chart}</pre>`
          }
        }
      }

      safeRender()
    }
  }, [chart])

  return <div ref={ref} className='flex justify-center' />
}

export default MermaidChart