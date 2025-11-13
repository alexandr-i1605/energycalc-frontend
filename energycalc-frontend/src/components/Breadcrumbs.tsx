import { FC } from 'react'
import { Breadcrumb } from 'react-bootstrap'
import { Link } from 'react-router-dom'

interface Crumb {
  label: string
  path?: string
}

interface BreadcrumbsProps {
  crumbs: Crumb[]
}

const Breadcrumbs: FC<BreadcrumbsProps> = ({ crumbs }) => {
  return (
    <Breadcrumb className="mb-4">
      <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
        Главная
      </Breadcrumb.Item>
      {crumbs.map((crumb, index) => (
        <Breadcrumb.Item
          key={index}
          linkAs={crumb.path ? Link : undefined}
          linkProps={crumb.path ? { to: crumb.path } : undefined}
          active={index === crumbs.length - 1 && !crumb.path}
        >
          {crumb.label}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  )
}

export default Breadcrumbs