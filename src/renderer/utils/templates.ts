export const STARTER_TEMPLATES = {
  blank: {
    name: 'Blank',
    root: {
      id: 'root',
      type: 'container',
      children: [],
      props: {},
      styles: { minHeight: '100vh' },
      attributes: {},
    } as any,
  },
  landing: {
    name: 'Landing Page',
    root: {
      id: 'root',
      type: 'container',
      children: [
        {
          id: 'hero',
          type: 'container',
          children: [
            { id: 'hero-text', type: 'text', props: { content: 'Build something amazing', tag: 'h1' }, styles: { textAlign: 'center', padding: '60px 20px' }, attributes: {} },
          ],
          props: {},
          styles: { backgroundColor: '#0f172a', color: '#ffffff' },
          attributes: {},
        },
        {
          id: 'features',
          type: 'row',
          children: [
            { id: 'f1', type: 'column', children: [], props: {}, styles: { padding: '20px' }, attributes: {} },
            { id: 'f2', type: 'column', children: [], props: {}, styles: { padding: '20px' }, attributes: {} },
            { id: 'f3', type: 'column', children: [], props: {}, styles: { padding: '20px' }, attributes: {} },
          ],
          props: {},
          styles: {},
          attributes: {},
        },
      ],
      props: {},
      styles: {},
      attributes: {},
    } as any,
  },
}
