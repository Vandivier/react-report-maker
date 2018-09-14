import React from 'react'
import Link from 'next/link'
import Header from '../components/Header'

export default () => (
  <div>
    <Header />
    <p>HOME PAGE is here!</p>
  <ul>
    <li><Link href='/a' as='/a'><a>appl</a></Link></li>
    <li><Link href='/b' as='/b'><a>ban</a></Link></li>
    <li>
      <Link
        href={{pathname: '/posts', query: { id: '2' }}}
        as='/posts/2'
      >
        <a>post #2</a>
      </Link>
    </li>
  </ul>
  <ul>
    <li><a href='/robots.txt'>/robots.txt</a></li>
    <li><a href='/sitemap.xml'>/sitemap.xml</a></li>
    <li><a href='/favicon.ico'>/favicon.ico</a></li>
  </ul>
  </div>
)
