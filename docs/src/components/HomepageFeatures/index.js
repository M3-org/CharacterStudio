import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Powerful Creation',
    Svg: require('/img/skeleton.svg').default,
    description: (
      <>
        Web based point and click VRM avatar builder with support for custom assets.
        Support for batch exporting, and more
      </>
    ),
  },
  {
    title: 'High Performance',
    Svg: require('/img/speed.svg').default,
    description: (
      <>
        Drag and drop VRM optimization tools + Automated methods for culling between layers
	and reducing draw calls.
      </>
    ),
  },
  {
    title: 'Transparent Development',
    Svg: require('/img/opensource.svg').default,
    description: (
      <>
        Open source and community driven by people that care about the future
	of VRM and interoperable open standards.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
