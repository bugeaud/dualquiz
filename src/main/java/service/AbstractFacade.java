package service;

import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.NonUniqueResultException;
import javax.persistence.Query;

/**
 * Facade to generate REST services
 * @licence http://www.gnu.org/licenses/agpl-3.0.html
 * @author bugeaud at gmail dot com
 */
public abstract class AbstractFacade<T> {
    private Class<T> entityClass;

    public AbstractFacade(Class<T> entityClass) {
        this.entityClass = entityClass;
    }

    protected abstract EntityManager getEntityManager();

    public void create(T entity) {
        getEntityManager().persist(entity);
    }

    public void edit(T entity) {
        getEntityManager().merge(entity);
    }

    public void remove(T entity) {
        getEntityManager().remove(getEntityManager().merge(entity));
    }

    public T find(Object id) {
        return getEntityManager().find(entityClass, id);
    }

    protected boolean exists(Query countQuery, Object key) {
        try{
            List<?> items = countQuery.setParameter("key", key).getResultList();
            //return ((Long)countQuery.setParameter("key", key).getSingleResult()).intValue() > 0;
            return items == null ? false : items.size() > 0;
        }catch(NonUniqueResultException nex){
            // As a protective mesure, we will assume that if there are multiple element it exists
            return true;
        }catch(NoResultException rex){
            // As a protective mesure, we will assume that if there are no result it does not exist
            return false;
        }
    }
    
    public List<T> findAll() {
        /** @todo switch to criteria once OGM-8 is fixed (see https://hibernate.atlassian.net/browse/OGM-8 ) */
        //javax.persistence.criteria.CriteriaQuery cq = getEntityManager().getCriteriaBuilder().createQuery();
        //cq.select(cq.from(entityClass));
        //return getEntityManager().createQuery(cq).getResultList();
        
        return getEntityManager().createQuery("select o from "+entityClass.getName()+" o", entityClass).getResultList();
    }

    public List<T> findRange(int[] range) {
        /** @todo switch to criteria once OGM-8 is fixed (see https://hibernate.atlassian.net/browse/OGM-8 ) */
        //javax.persistence.criteria.CriteriaQuery cq = getEntityManager().getCriteriaBuilder().createQuery();
        //cq.select(cq.from(entityClass));
        //javax.persistence.Query q = getEntityManager().createQuery(cq);
        javax.persistence.Query q = getEntityManager().createQuery("select o from "+entityClass.getName()+" o", entityClass);
        q.setMaxResults(range[1] - range[0] + 1);
        q.setFirstResult(range[0]);
        return q.getResultList();
    }

    public List<T> findRange(int[] range, String query, Object keyValue) {
        javax.persistence.Query q = getEntityManager().createNamedQuery(query);
        q.setParameter("key", keyValue);
        q.setMaxResults(range[1] - range[0] + 1);
        q.setFirstResult(range[0]);
        return q.getResultList();
    }

    
    public int count() {
        /** @todo switch to criteria once OGM-8 is fixed (see https://hibernate.atlassian.net/browse/OGM-8 ) */
        //javax.persistence.criteria.CriteriaQuery cq = getEntityManager().getCriteriaBuilder().createQuery();
        //javax.persistence.criteria.Root<T> rt = cq.from(entityClass);
        //cq.select(getEntityManager().getCriteriaBuilder().count(rt));
        //javax.persistence.Query q = getEntityManager().createQuery(cq);
        //
        // Use of count is failing because of :
        //https://hibernate.atlassian.net/browse/OGM-927
        //
        //javax.persistence.Query q = getEntityManager().createQuery("select count(o) from "+entityClass.getName()+" o where 1=1", Long.class);
        //return ((Long) q.getSingleResult()).intValue();
        javax.persistence.Query q = getEntityManager().createNativeQuery("db."+entityClass.getSimpleName()+".count()");
        return ((Long) q.getSingleResult()).intValue();
    }
    
}
